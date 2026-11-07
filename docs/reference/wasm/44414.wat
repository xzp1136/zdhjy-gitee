  (func (;44414;) (type 161) (param i32 i32 i32 f32 i32 i32 i32)
    (local f32 f32 f32 f32 i32 i32 i64)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 6
    global.set 0
    i32.const 4367425
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375560
      call 2180
      i32.const 3387108
      call 2180
      i32.const 3387112
      call 2180
      i32.const 3387116
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4367425
      i32.const 1
      i32.store8
    end
    local.get 6
    i32.const 0
    i32.store offset=12
    local.get 4
    i32.const 0
    i32.store
    local.get 5
    i32.const 0
    i32.store
    i32.const 3375560
    i32.load
    local.set 11
    local.get 0
    i32.load offset=48
    local.set 0
    local.get 6
    local.get 1
    i32.store
    block  ;; label = @1
      local.get 0
      local.get 6
      local.get 6
      i32.const 12
      i32.add
      local.get 11
      call 34286
      i32.eqz
      br_if 0 (;@1;)
      local.get 6
      i32.load offset=12
      local.tee 0
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      local.get 2
      i64.load align=4
      local.tee 13
      i64.const 32
      i64.shr_u
      i32.wrap_i64
      f32.reinterpret_i32
      local.set 8
      local.get 3
      local.get 3
      f32.mul
      local.set 9
      local.get 13
      i32.wrap_i64
      f32.reinterpret_i32
      local.set 10
      f32.const 0x1.fffffep+127 (;=3.40282e+38;)
      local.set 3
      local.get 1
      i32.const 3
      i32.eq
      local.set 2
      i32.const 0
      local.set 1
      loop  ;; label = @2
        local.get 0
        local.get 1
        local.get 6
        i32.const 3387116
        i32.load
        call 50458
        local.get 6
        i32.load
        local.set 0
        i32.const 3360788
        i32.load
        local.tee 11
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 11
          call 60460
        end
        block  ;; label = @3
          local.get 0
          i32.const 0
          i32.const 0
          call 48872
          if  ;; label = @4
            local.get 6
            i32.load offset=12
            local.get 1
            i32.const 3387108
            i32.load
            call 50451
            local.get 1
            i32.const 1
            i32.sub
            local.set 1
            br 1 (;@3;)
          end
          local.get 2
          i32.eqz
          if  ;; label = @4
            local.get 0
            i32.const 0
            call 48736
            i32.const 0
            call 48835
            i32.eqz
            br_if 1 (;@3;)
          end
          local.get 0
          i32.load8_u offset=96
          br_if 0 (;@3;)
          local.get 0
          i32.load8_u offset=108
          br_if 0 (;@3;)
          i32.const 0
          call 49305
          local.get 0
          f32.load offset=112
          f32.ge
          i32.eqz
          br_if 0 (;@3;)
          local.get 5
          i32.load
          local.set 11
          i32.const 3360788
          i32.load
          local.tee 12
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 12
            call 60460
          end
          local.get 11
          i32.const 0
          i32.const 0
          call 48872
          if  ;; label = @4
            local.get 5
            local.get 0
            i32.store
          end
          local.get 6
          local.get 0
          i32.const 0
          call 48735
          i32.const 0
          call 49468
          local.get 6
          f32.load
          local.get 10
          f32.sub
          local.tee 7
          local.get 7
          f32.mul
          local.get 6
          f32.load offset=4
          local.get 8
          f32.sub
          local.tee 7
          local.get 7
          f32.mul
          f32.add
          local.tee 7
          local.get 9
          f32.gt
          br_if 0 (;@3;)
          local.get 3
          local.get 7
          f32.le
          br_if 0 (;@3;)
          local.get 4
          local.get 0
          i32.store
          local.get 7
          local.set 3
        end
        local.get 1
        i32.const 1
        i32.add
        local.tee 1
        local.get 6
        i32.load offset=12
        local.tee 0
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 6
    i32.const 16
    i32.add
    global.set 0)
