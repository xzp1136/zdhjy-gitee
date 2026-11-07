  (func (;42749;) (type 1) (param i32 i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 1
    global.set 0
    i32.const 4366208
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3408192
      call 2180
      i32.const 3359836
      call 2180
      i32.const 3395032
      call 2180
      i32.const 3437472
      call 2180
      i32.const 4366208
      i32.const 1
      i32.store8
    end
    local.get 1
    i32.const 0
    i32.store offset=8
    i32.const 3359836
    i32.load
    local.tee 2
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 2
    else
      local.get 2
      call 60460
      i32.const 3359836
      i32.load
    end
    i32.load offset=92
    i32.load offset=28
    local.get 1
    i32.const 8
    i32.add
    i32.const 3395032
    i32.load
    call 45693
    local.get 1
    i32.const 0
    call 56067
    i32.load offset=192
    i32.store offset=4
    local.get 0
    i32.load offset=36
    local.set 2
    local.get 1
    i32.const 8
    i32.add
    i32.const 0
    call 53141
    local.set 3
    local.get 1
    i32.const 4
    i32.add
    i32.const 0
    call 53141
    local.set 4
    local.get 2
    local.get 3
    i32.const 3437472
    i32.load
    local.get 4
    i32.const 0
    call 48222
    local.get 2
    i32.load
    local.tee 3
    i32.load offset=796
    local.get 3
    i32.load offset=792
    call_indirect (type 2)
    local.get 0
    i32.load offset=28
    local.get 1
    i32.load offset=8
    f32.convert_i32_s
    local.get 1
    i32.load offset=4
    f32.convert_i32_s
    f32.div
    i32.const 0
    call 20639
    local.get 0
    i32.load offset=44
    local.get 1
    i32.const 12
    i32.add
    i32.const 3408192
    i32.load
    call 45354
    local.get 1
    i32.load offset=12
    local.get 1
    i32.load offset=8
    f32.convert_i32_s
    local.get 1
    i32.load offset=4
    f32.convert_i32_s
    f32.div
    i32.const 0
    call 20639
    local.get 1
    i32.load offset=4
    local.set 2
    local.get 1
    i32.load offset=8
    local.set 3
    local.get 0
    i32.load offset=20
    i32.const 1
    i32.const 0
    call 22475
    local.get 0
    i32.load offset=44
    local.set 4
    block  ;; label = @1
      local.get 2
      local.get 3
      i32.le_s
      if  ;; label = @2
        local.get 4
        i32.const 1
        i32.const 0
        call 48833
        i32.const 4366204
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3408108
          call 2180
          i32.const 3465952
          call 2180
          i32.const 4366204
          i32.const 1
          i32.store8
        end
        local.get 0
        i32.load8_u offset=175
        br_if 1 (;@1;)
        local.get 0
        i32.const 1
        i32.store8 offset=175
        local.get 0
        i32.load offset=52
        local.get 1
        i32.const 12
        i32.add
        i32.const 3408108
        i32.load
        call 45354
        local.get 1
        i32.load offset=12
        local.tee 0
        i32.const 1
        i32.const 0
        call 48707
        local.get 0
        i32.const 3465952
        i32.load
        i32.const 0
        f32.const 0x0p+0 (;=0;)
        i32.const 0
        call 20996
        br 1 (;@1;)
      end
      local.get 4
      i32.const 0
      i32.const 0
      call 48833
      i32.const 4366205
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3408108
        call 2180
        i32.const 4366205
        i32.const 1
        i32.store8
      end
      local.get 0
      i32.const 0
      i32.store8 offset=175
      local.get 0
      i32.load offset=52
      local.get 1
      i32.const 12
      i32.add
      i32.const 3408108
      i32.load
      call 45354
      local.get 1
      i32.load offset=12
      i32.const 0
      i32.const 0
      call 48707
    end
    local.get 1
    i32.const 16
    i32.add
    global.set 0)
