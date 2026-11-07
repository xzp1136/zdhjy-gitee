  (func (;43160;) (type 1) (param i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366524
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3359836
      call 2180
      i32.const 3395032
      call 2180
      i32.const 3395036
      call 2180
      i32.const 3364328
      call 2180
      i32.const 3482788
      call 2180
      i32.const 4366524
      i32.const 1
      i32.store8
    end
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
    i32.load
    local.get 2
    i32.const 4
    i32.add
    i32.const 3395032
    i32.load
    call 45693
    block  ;; label = @1
      local.get 2
      i32.load offset=4
      i32.const 100
      i32.ge_s
      if  ;; label = @2
        i32.const 3359836
        i32.load
        local.tee 1
        i32.load offset=116
        if (result i32)  ;; label = @3
          local.get 1
        else
          local.get 1
          call 60460
          i32.const 3359836
          i32.load
        end
        i32.load offset=92
        i32.load
        local.tee 1
        local.get 2
        i32.const 8
        i32.add
        i32.const 3395032
        i32.load
        call 45693
        i32.const 3395036
        i32.load
        local.set 3
        local.get 2
        local.get 2
        i32.load offset=8
        i32.const 100
        i32.sub
        i32.store offset=12
        local.get 1
        local.get 2
        i32.const 12
        i32.add
        local.get 3
        call 45694
        local.get 0
        local.get 2
        call 43161
        local.get 2
        i32.const 2
        i32.const 1
        local.get 2
        call 43162
        br 1 (;@1;)
      end
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 4367475
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364328
        call 2180
        i32.const 4367475
        i32.const 1
        i32.store8
      end
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3364328
        i32.load
      end
      i32.load offset=92
      i32.load
      i32.const 3482788
      i32.load
      f32.const 0x1.333334p-3 (;=0.15;)
      local.get 2
      call 43135
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0)
