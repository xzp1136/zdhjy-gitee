  (func (;41120;) (type 1) (param i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4365197
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3345348
      call 2180
      i32.const 3355160
      call 2180
      i32.const 3356428
      call 2180
      i32.const 3411544
      call 2180
      i32.const 3359836
      call 2180
      i32.const 3395032
      call 2180
      i32.const 3362416
      call 2180
      i32.const 3435332
      call 2180
      i32.const 3435160
      call 2180
      i32.const 4365197
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.const 1065353216
    i32.store offset=48
    i32.const 3359836
    i32.load
    local.tee 1
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 1
    else
      local.get 1
      call 60460
      i32.const 3359836
      i32.load
    end
    i32.load offset=92
    i32.load offset=8
    local.get 3
    i32.const 12
    i32.add
    i32.const 3395032
    i32.load
    call 45693
    local.get 0
    local.get 0
    i32.const 16
    i32.const 20
    local.get 3
    i32.load offset=12
    i32.const 1
    i32.eq
    select
    i32.add
    i32.load
    i32.store offset=24
    i32.const 0
    call 56067
    i32.const 624
    i32.add
    local.set 1
    i32.const 3355160
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    local.get 1
    i32.const 0
    call 38085
    local.set 1
    i32.const 0
    call 56067
    i32.const 628
    i32.add
    i32.const 0
    call 53141
    local.set 2
    i32.const 3435332
    i32.load
    local.get 1
    i32.const 3435160
    i32.load
    local.get 2
    i32.const 0
    call 48225
    local.set 1
    i32.const 3356428
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    local.get 1
    i32.const 0
    call 55817
    block  ;; label = @1
      i32.const 0
      call 56067
      i32.load8_u offset=624
      i32.eqz
      if  ;; label = @2
        local.get 0
        i32.load offset=24
        local.set 1
        br 1 (;@1;)
      end
      block  ;; label = @2
        block  ;; label = @3
          i32.const 0
          call 56067
          i32.load offset=628
          i32.const 1
          i32.eq
          br_if 0 (;@3;)
          i32.const 0
          call 56067
          i32.load offset=628
          i32.const 2
          i32.eq
          br_if 0 (;@3;)
          i32.const 0
          call 56067
          i32.load offset=628
          i32.const 3
          i32.ne
          br_if 1 (;@2;)
        end
        i32.const 0
        call 56067
        i32.const 2
        i32.store offset=364
      end
      local.get 0
      local.get 0
      i32.load offset=16
      local.tee 1
      i32.store offset=24
    end
    i32.const 3362416
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    local.get 0
    local.get 1
    i32.const 0
    i32.const 0
    call 50116
    local.tee 1
    i32.store offset=60
    i32.const 3345348
    i32.load
    call 1900
    local.tee 2
    local.get 0
    i32.const 3411544
    i32.load
    i32.const 0
    call 44658
    local.get 1
    local.get 2
    i32.const 0
    call 48693
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
