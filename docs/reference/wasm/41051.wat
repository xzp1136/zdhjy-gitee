  (func (;41051;) (type 2) (param i32 i32 i32)
    (local f32 f32 f32 i32 i32)
    i32.const 4365148
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 3364328
      call 2180
      i32.const 4365148
      i32.const 1
      i32.store8
    end
    local.get 0
    local.get 0
    i32.load offset=28
    local.get 1
    i32.sub
    local.tee 1
    i32.const 0
    local.get 1
    i32.const 0
    i32.gt_s
    select
    local.tee 7
    i32.store offset=28
    local.get 0
    i32.load offset=24
    local.set 6
    i32.const 3364328
    i32.load
    local.tee 1
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 1
      call 60460
    end
    i32.const 4367475
    i32.load8_u
    i32.eqz
    if  ;; label = @1
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
    if (result i32)  ;; label = @1
      local.get 1
    else
      local.get 1
      call 60460
      i32.const 3364328
      i32.load
    end
    i32.load offset=92
    i32.load
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
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
      i32.load offset=24
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      local.get 6
      local.get 7
      i32.sub
      f32.convert_i32_s
      local.tee 4
      local.get 6
      f32.convert_i32_s
      local.tee 5
      f32.div
      local.tee 3
      f32.const 0x1.e66666p-1 (;=0.95;)
      local.get 3
      f32.sub
      local.get 4
      f32.const 0x1.b33334p+0 (;=1.7;)
      f32.mul
      local.get 5
      f32.div
      f32.const 0x1p+0 (;=1;)
      local.get 3
      f32.sub
      f32.mul
      f32.mul
      f32.add
      local.set 3
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 3
      f32.const 0x1.9p+6 (;=100;)
      f32.mul
      local.set 3
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
      local.get 3
      f32.floor
      local.set 3
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
      i32.load offset=24
      local.get 0
      i32.load offset=28
      local.get 3
      i32.const 0
      call 42714
    end)
